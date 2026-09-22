/**
 * Real-Time Updates Manager
 * Handles live updates for elections and voting results
 * Uses polling as fallback (will be upgraded to WebSockets with Laravel Reverb/Pusher)
 */

import { useElectionStore } from "../stores/electionStore.js";
import { voterAPI } from "./api.js";

class RealtimeUpdatesManager {
    constructor(options = {}) {
        this.pollInterval = options.pollInterval || 5000;
        this.pollTimer = null;
        this.electionStore = useElectionStore();
        this.isRunning = false;
    }

    /**
     * Start polling for real-time updates
     */
    start() {
        if (this.isRunning) {
            console.warn("Real-time updates already running");
            return;
        }

        console.log("Starting real-time updates (polling mode)");
        this.isRunning = true;
        this.pollForElectionStatus();
        this.pollTimer = setInterval(
            () => this.pollForElectionStatus(),
            this.pollInterval,
        );
    }

    /**
     * Stop polling for updates
     */
    stop() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        this.isRunning = false;
        console.log("Real-time updates stopped");
    }

    /**
     * Poll for election status and trigger store updates
     */
    async pollForElectionStatus() {
        try {
            const response = await voterAPI.getElectionStatus();
            this.electionStore.setElectionStatus(response.data);

            // If election ended, fetch live results
            if (response.data.status === "ended") {
                await this.pollForLiveResults();
                this.stop(); // Stop polling once election ends
            }
        } catch (error) {
            console.error("Error polling election status:", error);
        }
    }

    /**
     * Poll for live election results
     */
    async pollForLiveResults() {
        try {
            const response = await voterAPI.getElectionLive();

            // Update store with new data
            if (response.data.vote_count !== undefined) {
                this.electionStore.updateVoteCount(response.data.vote_count);
            }

            if (response.data.results) {
                this.electionStore.setResults(response.data.results);
            }

            return response.data;
        } catch (error) {
            console.error("Error polling live results:", error);
        }
    }

    /**
     * Manually trigger a status check
     */
    async checkStatus() {
        return await this.pollForElectionStatus();
    }

    /**
     * Manually trigger live results check
     */
    async checkLiveResults() {
        return await this.pollForLiveResults();
    }

    /**
     * Future: Connect to WebSocket (Laravel Reverb/Pusher)
     * This method will replace polling once WebSocket is configured
     */
    connectWebSocket() {
        console.log(
            "WebSocket connection not yet configured. Using polling fallback.",
        );
        // TODO: Implement WebSocket connection here
        // Example:
        // const Echo = window.Echo;
        // Echo.channel('election-status')
        //   .listen('ElectionStatusUpdated', (event) => {
        //     this.electionStore.setElectionStatus(event.data);
        //   });
    }

    /**
     * Disconnect WebSocket
     */
    disconnectWebSocket() {
        console.log("WebSocket disconnection not implemented");
        // TODO: Implement WebSocket disconnection
    }
}

// Create singleton instance
let realtimeManager = null;

export function initializeRealtimeUpdates(options = {}) {
    if (!realtimeManager) {
        realtimeManager = new RealtimeUpdatesManager(options);
    }
    return realtimeManager;
}

export function getRealtimeUpdatesManager() {
    if (!realtimeManager) {
        realtimeManager = new RealtimeUpdatesManager();
    }
    return realtimeManager;
}

export function stopRealtimeUpdates() {
    if (realtimeManager) {
        realtimeManager.stop();
    }
}

export default RealtimeUpdatesManager;
