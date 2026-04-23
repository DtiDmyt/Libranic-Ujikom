<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreAdministratorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        $accountRole = $this->string('account_role')->toString() ?: 'admin';
        $isBorrower = $accountRole === 'peminjam';

        $passwordRules = ['required', Password::defaults()];

        if ($isBorrower) {
            $passwordRules[] = 'confirmed';
        }

        $roleRules = $isBorrower
            ? ['required', 'string', Rule::in(['murid', 'guru', 'lainnya'])]
            : ['nullable', 'string', Rule::in(['murid', 'guru', 'lainnya'])];

        $kelasRules = $isBorrower
            ? ['required_if:role,murid', 'nullable', 'string', 'max:100']
            : ['nullable', 'string', 'max:100'];

        $phoneRules = $isBorrower
            ? ['required', 'string', 'max:20']
            : ['nullable', 'string', 'max:20'];

        $identitasRules = $isBorrower
            ? [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'identitas'),
            ]
            : ['nullable', 'string', 'max:50'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => $passwordRules,
            'password_confirmation' => $isBorrower ? ['required', 'string'] : ['nullable', 'string'],
            'account_role' => ['required', 'string', Rule::in(config('administrator.roles', ['admin', 'peminjam']))],
            'phone' => $phoneRules,
            'role' => $roleRules,
            'kelas' => $kelasRules,
            'identitas' => $identitasRules,
        ];
    }
}
