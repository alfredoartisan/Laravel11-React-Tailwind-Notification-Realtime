<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('conversations')) {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id(); // ID de la conversación
            $table->unsignedBigInteger('user_id1'); // Usuario que inicia la conversación
            $table->unsignedBigInteger('user_id2'); // Usuario que recibe la conversación
            $table->foreign('user_id1')->references('id')->on('users')->onDelete('cascade'); // Clave foránea hacia la tabla 'users'
            $table->foreign('user_id2')->references('id')->on('users')->onDelete('cascade'); // Clave foránea hacia la tabla 'users'
            $table->foreignId('last_message_id')->nullable()->constrained('messages')->onDelete('set null'); // Último mensaje en la conversación
            $table->timestamps(); // created_at y updated_at
        });
    }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
