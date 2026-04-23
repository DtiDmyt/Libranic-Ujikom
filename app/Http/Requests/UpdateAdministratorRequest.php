<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateAdministratorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->account_role === 'admin';
    }

    public function rules(): array
    {
        /** @var User|null $administrator */
        $administrator = $this->route('administrator');
        $administratorId = $administrator?->id;
        $accountRole = $this->string('account_role')->toString() ?: ($administrator?->account_role ?? 'admin');
        $isBorrower = $accountRole === 'peminjam';

        $passwordRules = ['nullable', Password::defaults()];

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
                Rule::unique(User::class, 'identitas')->ignore($administratorId),
            ]
            : ['nullable', 'string', 'max:50'];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($administratorId),
            ],
            'password' => $passwordRules,
            'password_confirmation' => ['nullable', 'string'],
            'account_role' => ['required', 'string', Rule::in(config('administrator.roles', ['admin', 'peminjam']))],
            'phone' => $phoneRules,
            'role' => $roleRules,
            'kelas' => $kelasRules,
            'identitas' => $identitasRules,
        ];
    }
}
