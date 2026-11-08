<?php

use Illuminate\\Support\\Facades\\Artisan;

Artisan::command('about:marketplace', function (): void {
    $this->comment('Rad Art Marketplace — Persian-first art discovery.');
})->purpose('Display marketplace project information');
