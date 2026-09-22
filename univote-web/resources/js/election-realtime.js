/**
 * Election Real-Time Updates Module
 * Handles live election status and results updates for voters
 */

class ElectionRealtimeUpdates {
    constructor(options = {}) {
        this.pollInterval = options.pollInterval || 5000; // Poll every 5 seconds
        this.pollTimer = null;
        this.onStatusChange = options.onStatusChange || null;
        this.onElectionEnded = options.onElectionEnded || null;
        this.onResultsUpdate = options.onResultsUpdate || null;
        this.currentStatus = null;
        this.statusUrl = "/voter/api/election/status";
        this.resultsUrl = "/voter/api/election/results";
    }

    /**
     * Start polling for election status updates
     */
    start() {
        if (this.pollTimer) {
            console.warn("Election updates already running");
            return;
        }

        console.log("Starting election real-time updates");
        this.pollForUpdates(); // Initial check
        this.pollTimer = setInterval(
            () => this.pollForUpdates(),
            this.pollInterval
        );
    }

    /**
     * Stop polling for updates
     */
    stop() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
            console.log("Stopped election real-time updates");
        }
    }

    /**
     * Poll for election status
     */
    async pollForUpdates() {
        try {
            const response = await fetch(this.statusUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                console.error(
                    "Failed to fetch election status:",
                    response.statusText
                );
                return;
            }

            const data = await response.json();

            // Check if status changed
            if (this.currentStatus !== data.status) {
                this.currentStatus = data.status;

                // Trigger status change callback
                if (this.onStatusChange) {
                    this.onStatusChange(data);
                }

                // If election ended, fetch results and trigger callback
                if (data.status === "ended") {
                    console.log("Election has ended!");
                    await this.fetchResults();

                    if (this.onElectionEnded) {
                        this.onElectionEnded(data);
                    }

                    // Stop polling once election ends
                    this.stop();
                }
            }
        } catch (error) {
            console.error("Error polling election status:", error);
        }
    }

    /**
     * Fetch election results
     */
    async fetchResults() {
        try {
            const response = await fetch(this.resultsUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                console.error("Failed to fetch results:", response.statusText);
                return;
            }

            const data = await response.json();

            if (this.onResultsUpdate) {
                this.onResultsUpdate(data);
            }

            return data;
        } catch (error) {
            console.error("Error fetching election results:", error);
        }
    }

    /**
     * Get current cached status
     */
    getStatus() {
        return this.currentStatus;
    }

    /**
     * Manually trigger a status check
     */
    async checkStatus() {
        return await this.pollForUpdates();
    }
}

// Export for use in modules
if (typeof module !== "undefined" && module.exports) {
    module.exports = ElectionRealtimeUpdates;
}
