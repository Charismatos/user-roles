<?php

namespace App\DTOs\Auth\Guest;

readonly class UserData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $username = null,
        public ?string $password = null,
        public ?array $roles = []
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            username: $data['username'] ?? null,
            password: $data['password'] ?? null,
            roles: $data['roles'] ?? []
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'username' => $this->username,
            'password' => $this->password,
            // 'roles' => $this->roles,
        ]);
    }
}
