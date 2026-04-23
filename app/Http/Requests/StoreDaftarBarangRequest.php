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
            'judul_buku' => ['required_without:nama_alat', 'string', 'max:255'],
            'nama_alat' => ['nullable', 'string', 'max:255'],
            'penulis' => ['required', 'string', 'max:255'],
            'penerbit' => ['required', 'string', 'max:255'],
            'tahun_terbit' => ['required', 'integer', 'between:1900,3000'],
            'kategori_jurusan' => ['nullable', 'string', 'max:255'],
            'kategori_alat_id' => ['required', 'integer', 'exists:kategori_buku,id'],
            'stok' => ['required', 'integer', 'min:0'],
            'lokasi_rak' => ['required_without:ruangan', 'string', 'max:255'],
            'ruangan' => ['nullable', 'string', 'max:255'],
            'denda_keterlambatan' => ['nullable', 'integer', 'min:0'],
            'kondisi_alat' => ['required', 'string'],
            'deskripsi' => ['nullable', 'string'],
            'status_buku' => ['required_without:status', 'in:tersedia,dipinjam,rusak,hilang'],
            'status' => ['nullable', 'in:publik,draft'],
            'gambar' => ['nullable', 'image', 'max:2048'],
        ];
    }
}
