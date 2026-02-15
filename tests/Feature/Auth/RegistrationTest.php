<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'account_role' => 'peminjam',
            'role' => 'murid',
            'kelas' => 'XI PPLG 1',
            'identitas' => 'REG-0001',
            'phone' => '081234567890',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login'));

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'account_role' => 'peminjam',
        ]);
    }
}
