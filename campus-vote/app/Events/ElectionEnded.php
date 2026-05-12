<?php

namespace App\Events;

use App\Models\Election;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ElectionEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $election;
    public $results;

    /**
     * Create a new event instance.
     */
    public function __construct(Election $election)
    {
        $this->election = $election;
        $this->results = $this->calculateResults($election);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('election.' . $this->election->id),
            new Channel('elections'),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'election_id' => $this->election->id,
            'election_title' => $this->election->title,
            'status' => 'ended',
            'results' => $this->results,
            'timestamp' => now()->toDateTimeString(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'election.ended';
    }

    /**
     * Calculate election results.
     */
    private function calculateResults(Election $election): array
    {
        $results = [];

        foreach ($election->positions as $position) {
            $candidates = $position->candidates()->withCount('votes')->get();
            $totalVotes = $candidates->sum('votes_count');

            $results[$position->name] = $candidates->map(function ($candidate) use ($totalVotes) {
                return [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'votes' => $candidate->votes_count,
                    'percentage' => $totalVotes > 0 ? round(($candidate->votes_count / $totalVotes) * 100, 2) : 0,
                ];
            })->sortByDesc('votes')->values()->toArray();
        }

        return $results;
    }
}
