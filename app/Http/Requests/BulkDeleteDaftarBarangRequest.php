<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteDaftarBarangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:daftar_buku,id'],
        ];
    }
}
