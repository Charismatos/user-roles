<?php

/**
 * =============================================================================
 * WHAT: Universal Database Migration for Hierarchical Cascading Taxonomies (PHP / Laravel Schema)
 * WHEN: Executed via Artisan migrate command during application deployment or database setup.
 * WHY:  Provides a robust, sector-agnostic Adjacency List relational schema (parent_id)
 *       capable of supporting 10,000+ distinct Laravel projects across 21 enterprise sectors.
 * WHO:  Backend Engineers, Database Administrators, and Full-Stack Architects.
 * WHERE: Saved at database/migrations/2026_11_17_000000_create_geographies_table.php
 * HOW:  Run `php artisan migrate` in your terminal to deploy the table structure.
 * -----------------------------------------------------------------------------
 * HOW TO CALL / REFERENCE THIS MIGRATION IN HOST PROJECTS:
 * Automatically executed by Laravel's migration runner. To customize the table name
 * or adapt it for specialized domains (e.g., 'crop_varieties', 'bank_ledgers'), modify
 * the string parameter inside `Schema::create('geographies', function (Blueprint $table) { ... })`.
 * -----------------------------------------------------------------------------
 * HOW TO CUSTOMIZE / ENTER CUSTOM VALUES IN HOST PROJECTS:
 * - Table Renaming: Change `'geographies'` to your domain table name (e.g., `'medical_wards'`).
 * - Additional Columns: Add custom database fields right before `$table->timestamps();`
 *   (e.g., `$table->string('code')->nullable();` or `$table->json('metadata')->nullable();`).
 * -----------------------------------------------------------------------------
 * ABBREVIATIONS GLOSSARY FOR THIS FILE & COMMENTS:
 *    - ID: Identifier (Unique database primary key)
 *    - SQL: Structured Query Language (Database querying language)
 *    - PHP: Hypertext Preprocessor (Server-side scripting language)
 *    - FK: Foreign Key (Relational database pointer)
 *    - API: Application Programming Interface
 *    - DTO: Data Transfer Object
 *    - ORM: Object-Relational Mapping
 *    - JSON: JavaScript Object Notation
 * -----------------------------------------------------------------------------
 * FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FEATURES):
 * 1. ADDING SOFT DELETES (Trash / Restoration):
 *    - Where: In database/migrations/*_create_geographies_table.php and app/Models/Geography.php.
 *    - How: Add `$table->softDeletes();` inside the migration schema builder closure,
 *      and use `use Illuminate\Database\Eloquent\SoftDeletes;` inside the Geography model.
 * 2. ADDING MULTI-TENANCY (Project/Workspace Isolation):
 *    - Where: Migration, DTO, and Form Request.
 *    - How: Add `$table->foreignId('team_id')->constrained()->cascadeOnDelete();` to the migration schema.
 * =============================================================================
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the database migrations.
     * Abbreviations: ID (Identifier), SQL (Structured Query Language).
     */
    public function up(): void
    {
        Schema::create('geographies', function (Blueprint $table) {
            $table->id(); // ID = Identifier (Primary Key ID)
            $table->string('name');
            $table->string('slug')->unique();
            // Foreign Key ID pointing back to the parent geography (Adjacency List Pattern)
            $table->foreignId('parent_id')->nullable()->constrained('geographies')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);

            /*
             * [FUTURE MODIFICATION POINT - SOFT DELETES]:
             * Uncomment the line below to enable trash and restoration:
             * $table->softDeletes();
             */

            /*
             * [FUTURE MODIFICATION POINT - MULTI-TENANCY]:
             * Uncomment the line below to isolate records by workspace/team:
             * $table->foreignId('team_id')->nullable()->constrained()->cascadeOnDelete();
             */

            $table->timestamps(); // Created At and Updated At timestamps
        });
    }

    /**
     * Reverse the database migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('geographies');
    }
};

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 * 1. SECTOR-SPECIFIC ADAPTATIONS:
 *    - Agriculture: Rename table to `crop_geographies` or `crop_varieties`.
 *    - Finance: Rename table to `chart_of_accounts` or `ledger_geographies`.
 *    - Health: Rename table to `medical_specialties` or `ward_departments`.
 * 2. HOW TO CUSTOMIZE SCHEMA COLUMNS:
 *    To add metadata or icon support across your projects, insert columns right before `timestamps`:
 *    `$table->string('icon')->nullable();`
 *    `$table->json('metadata')->nullable();`
 * =============================================================================
 */
