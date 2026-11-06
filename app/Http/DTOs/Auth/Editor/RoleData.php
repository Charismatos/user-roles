<?php

namespace App\Http\DTOs\Auth\Editor;

readonly class RoleData
{
    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description = null,
        public int $level = 99,
        public bool $is_system = false
    ) {}

    public static function fromArray(array $data, ?self $fallback = null): self
    {
        return new self(
            name: $data['name'] ?? $fallback?->name ?? '',
            slug: $data['slug'] ?? $fallback?->slug ?? '',
            description: array_key_exists('description', $data) ? $data['description'] : $fallback?->description,
            level: isset($data['level']) ? (int) $data['level'] : ($fallback?->level ?? 99),
            is_system: isset($data['is_system'])
                ? filter_var($data['is_system'], FILTER_VALIDATE_BOOLEAN)
                : ($fallback?->is_system ?? false)
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'level' => $this->level,
            'is_system' => $this->is_system,
        ];
    }
}
