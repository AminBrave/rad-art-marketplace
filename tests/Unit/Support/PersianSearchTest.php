<?php

declare(strict_types=1);

namespace Tests\Unit\Support;

use App\Support\PersianSearch;
use PHPUnit\Framework\TestCase;

final class PersianSearchTest extends TestCase
{
    public function test_arabic_yeh_and_kaf_are_normalized_to_persian_variants(): void
    {
        self::assertSame('کیفیت', PersianSearch::normalize('كيفيت'));
    }

    public function test_arabic_and_persian_digits_are_normalized_to_ascii_digits(): void
    {
        self::assertSame('0123456789', PersianSearch::normalize('٠١٢٣٤٥٦٧٨٩'));
        self::assertSame('0123456789', PersianSearch::normalize('۰۱۲۳۴۵۶۷۸۹'));
    }

    public function test_tatweel_diacritics_and_zero_width_non_joiner_are_normalized(): void
    {
        self::assertSame('کتاب خوب', PersianSearch::normalize("كِـتاب\u{200C}خوب"));
    }

    public function test_repeated_whitespace_is_trimmed_and_collapsed(): void
    {
        self::assertSame('hello world', PersianSearch::normalize("  HELLO\t\n  WORLD  "));
    }

    public function test_null_and_empty_values_normalize_to_an_empty_string(): void
    {
        self::assertSame('', PersianSearch::normalize(null));
        self::assertSame('', PersianSearch::normalize('  '));
    }

    public function test_plain_latin_values_are_lowercased(): void
    {
        self::assertSame('rademan', PersianSearch::normalize('RADEMAN'));
    }
}
