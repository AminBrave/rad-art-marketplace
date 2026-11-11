<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;

final class PersianSearch
{
    /**
     * Add a LIKE predicate that treats common Arabic/Persian character variants
     * as equivalent without changing the stored display text.
     */
    public static function whereLike(Builder $query, string $column, string $term, string $boolean = 'and'): void
    {
        if (! in_array($boolean, ['and', 'or'], true)) {
            throw new \InvalidArgumentException('Unsupported boolean operator.');
        }

        $wrappedColumn = $query->getQuery()->getGrammar()->wrap($column);
        $expression = 'LOWER('.$wrappedColumn.')';

        foreach (self::characterMap() as $from => $to) {
            $expression = "REPLACE({$expression}, '{$from}', '{$to}')";
        }

        $normalized = self::normalize($term);
        $escaped = str_replace(['!', '%', '_'], ['!!', '!%', '!_'], $normalized);

        $query->whereRaw($expression." LIKE ? ESCAPE '!'", ['%'.$escaped.'%'], $boolean);
    }

    public static function normalize(string $value): string
    {
        $value = strtr($value, self::characterMap());
        $value = preg_replace('/[\x{064B}-\x{065F}\x{0670}]/u', '', $value) ?? $value;
        $value = preg_replace('/\s+/u', ' ', trim($value)) ?? trim($value);

        return strtolower($value);
    }

    /**
     * @return array<string, string>
     */
    private static function characterMap(): array
    {
        return [
            'ي' => 'ی',
            'ى' => 'ی',
            'ك' => 'ک',
            'ـ' => '',
            "\u{200C}" => ' ',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            'َ' => '', 'ً' => '', 'ُ' => '', 'ٌ' => '', 'ِ' => '', 'ٍ' => '',
            'ْ' => '', 'ّ' => '', 'ٰ' => '',
        ];
    }
}
