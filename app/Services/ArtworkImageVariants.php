<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Throwable;

final class ArtworkImageVariants
{
    private const VARIANTS = [
        'card' => ['max_edge' => 640, 'quality' => 78],
        'detail' => ['max_edge' => 1600, 'quality' => 84],
    ];

    public function generate(string $originalPath): void
    {
        $disk = Storage::disk('local');

        if (! function_exists('imagecreatefromstring') || ! $disk->exists($originalPath)) {
            return;
        }

        $absolutePath = $disk->path($originalPath);
        $imageInfo = @getimagesize($absolutePath);

        if (! is_array($imageInfo) || empty($imageInfo[0]) || empty($imageInfo[1])) {
            return;
        }

        [$width, $height] = $imageInfo;
        if (! $this->hasSafeMemoryBudget($width, $height) || $this->hasUnsupportedExifOrientation($absolutePath, $imageInfo['mime'] ?? '')) {
            return;
        }

        $contents = @file_get_contents($absolutePath);
        if (! is_string($contents)) {
            return;
        }

        $source = @imagecreatefromstring($contents);
        unset($contents);

        if ($source === false) {
            return;
        }

        try {
            foreach (self::VARIANTS as $variant => $settings) {
                $path = $this->pathFor($originalPath, $variant);
                if ($disk->exists($path)) {
                    continue;
                }

                $this->writeVariant($source, $width, $height, $path, $settings['max_edge'], $settings['quality']);
            }
        } catch (Throwable) {
            $this->deleteForOriginal($originalPath);
        } finally {
            imagedestroy($source);
        }
    }

    public function pathFor(string $originalPath, string $variant): ?string
    {
        if (! isset(self::VARIANTS[$variant])) {
            return null;
        }

        $extension = function_exists('imagewebp') ? 'webp' : 'png';

        return 'artwork-variants/'.hash('sha256', $originalPath).'/'.$variant.'.'.$extension;
    }

    public function deleteForOriginal(string $originalPath): void
    {
        Storage::disk('local')->deleteDirectory('artwork-variants/'.hash('sha256', $originalPath));
    }

    private function writeVariant($source, int $width, int $height, string $path, int $maxEdge, int $quality): void
    {
        $scale = min(1, $maxEdge / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $target = imagecreatetruecolor($targetWidth, $targetHeight);

        if ($target === false) {
            return;
        }

        try {
            imagealphablending($target, false);
            imagesavealpha($target, true);

            if (! imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height)) {
                return;
            }

            $disk = Storage::disk('local');
            $disk->makeDirectory(dirname($path));
            $absolutePath = $disk->path($path);
            $written = function_exists('imagewebp')
                ? imagewebp($target, $absolutePath, $quality)
                : imagepng($target, $absolutePath, 6);

            if (! $written) {
                $disk->delete($path);
            }
        } finally {
            imagedestroy($target);
        }
    }

    private function hasSafeMemoryBudget(int $width, int $height): bool
    {
        $limit = trim((string) ini_get('memory_limit'));
        if ($limit === '' || $limit === '-1') {
            return true;
        }

        $unit = strtolower(substr($limit, -1));
        $value = (int) $limit;
        $bytes = match ($unit) {
            'g' => $value * 1024 * 1024 * 1024,
            'm' => $value * 1024 * 1024,
            'k' => $value * 1024,
            default => $value,
        };

        // Leave headroom for Laravel, the decoded source, and the resized canvas.
        $estimatedBytes = ($width * $height * 5) + memory_get_usage(true) + (24 * 1024 * 1024);

        return $estimatedBytes < $bytes;
    }

    private function hasUnsupportedExifOrientation(string $absolutePath, string $mime): bool
    {
        if ($mime !== 'image/jpeg') {
            return false;
        }

        // Avoid silently rotating camera photos incorrectly when EXIF support is unavailable.
        if (! function_exists('exif_read_data')) {
            return true;
        }

        $metadata = @exif_read_data($absolutePath, 'IFD0');
        $orientation = is_array($metadata) ? (int) ($metadata['Orientation'] ?? 1) : 1;

        return $orientation !== 1;
    }
}
