<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Persist a concise activity snapshot for timeline rendering.
     */
    public static function record(?int $userId, string $description, array $metadata = []): void
    {
        static::create([
            'user_id' => $userId,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}
