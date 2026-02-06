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

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($administratorId),
            ],
            'password' => ['nullable', Password::defaults()],
            'account_role' => ['required', 'string', Rule::in(config('administrator.roles', ['admin', 'petugas']))],
        ];
    }
}
