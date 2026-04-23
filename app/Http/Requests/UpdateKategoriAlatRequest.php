<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKategoriAlatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        $id = $this->route('kategoriAlat')?->id ?? $this->route('id');

        return [
            'nama' => ['required', 'string', 'max:255', 'unique:kategori_buku,nama,' . $id],
        ];
    }
}
