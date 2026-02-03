<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $accountRole = fake()->randomElement(['admin', 'petugas', 'peminjam']);
        $role = $accountRole === 'peminjam'
            ? fake()->randomElement(['murid', 'guru', 'lainnya'])
            : null;

        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'account_role' => $accountRole,
            'role' => $role,
            'kelas' => $role === 'murid'
                ? fake()->randomElement(['X PPLG 1', 'XI TKJ 2', 'XII RPL 3'])
                : null,
            'phone' => fake()->numerify('08##########'),
            'identitas' => $accountRole === 'peminjam'
                ? fake()->unique()->numerify('99######')
                : null,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn(array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
