<?php

namespace Database\Seeders;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Group;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Juan Perez',
            'email' => 'juan@example.com',
            'password' => bcrypt('password'),
            'is_admin' => true
        ]);
        User::factory()->create([
            'name' => 'Juana Perez',
            'email' => 'juana@example.com',
            'password' => bcrypt('password'),
        ]);
        user::factory(10)->create();

        for ($i = 0; $i < 10; $i++) {
            $group = Group::factory()->create([
                'owner_id' => 1,
            ]);

            $users = User::inRandomOrder()->limit(rand(2, 5))->pluck('id');

            $group->users()->attach(array_unique([1, ...$users]));
        }


        Message::factory(100)->create();

        /* dd(User::all()); */
        
        $messages = Message::whereNull('group_id')->orderBy('created_at')->get();

        $conversations = $messages->groupBy(function ($message) {
            return collect([$message->sender_id, $message->receiver_id])->sort()->implode('-');
        })->map(function ($groupedMessages) {
            return [
                'user_id1' => $groupedMessages->first()->sender_id,
                'user_id2' => $groupedMessages->first()->receiver_id,
                'last_message_id' => $groupedMessages->last()->id,
                'created_at'=> new Carbon(),
                'updated_at'=> new Carbon(),
            ];
        })->values();

        Conversation::insertOrIgnore($conversations->toArray());
    }
}