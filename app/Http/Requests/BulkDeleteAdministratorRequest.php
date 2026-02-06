<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkDeleteAdministratorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        $roles = config('administrator.roles', ['admin', 'petugas']);

        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => [
                'integer',
                Rule::exists('users', 'id')->where(fn($query) => $query->whereIn('account_role', $roles)),
            ],
        ];
    }
}
