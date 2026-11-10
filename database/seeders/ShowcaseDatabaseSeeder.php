<?php

declare(strict_types=1);

namespace Database\\Seeders;

use Illuminate\\Database\\Seeder;
use RuntimeException;

class ShowcaseDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('production')) {
            throw new RuntimeException('Showcase seeding is available only in the production environment.');
        }

        if (filter_var(env('RADEMAN_SHOWCASE_SEEDING_ENABLED', false), FILTER_VALIDATE_BOOL) !== true) {
            throw new RuntimeException('Set RADEMAN_SHOWCASE_SEEDING_ENABLED=true in the hosting environment before running this seeder.');
        }

        app(DemoDatabaseSeeder::class)->runForShowcase();

        $this->command?->info('Rademan production showcase dataset seeded. Existing records were preserved.');
    }
}
