<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreKategoriAlatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255', 'unique:kategori_buku,nama'],
        ];
    }
}
