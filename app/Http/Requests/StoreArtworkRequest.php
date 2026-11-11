<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Artwork;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArtworkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Artwork::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:3000'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('is_active', true)],
            'medium' => ['nullable', 'string', 'max:120'],
            'dimensions' => ['nullable', 'string', 'max:120'],
            'year' => ['nullable', 'integer', 'min:1000', 'max:'.(now()->year + 1)],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'availability' => ['required', Rule::in(['available', 'sold', 'not_for_sale'])],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'dimensions:max_width=6000,max_height=6000', 'max:5120'],
        ];
    }
}
