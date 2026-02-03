<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'account_role' => $input['account_role'] ?? 'peminjam',
            'role' => $input['role'] ?? 'murid',
            'kelas' => $input['kelas'] ?? null,
            'phone' => $input['phone'] ?? null,
            'identitas' => $input['identitas'] ?? null,
            'password' => $input['password'],
        ]);
    }
}
