<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDaftarBarangRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        return [
            'nama_alat' => ['required', 'string', 'max:255'],
            'kategori_jurusan' => ['required', 'string', 'max:255'],
            'kategori_alat_id' => ['required', 'integer', 'exists:kategori_alat,id'],
            'ruangan' => ['required', 'string', 'max:255'],
            'denda_keterlambatan' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:publik,draft'],
            'gambar' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
