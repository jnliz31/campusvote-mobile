/**
 * WebSocket Configuration
 * Handles real-time updates using Laravel Echo and Pusher
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance = null;

export function initializeWebSocket() {
    if (echoInstance) {
        console.warn("WebSocket already initialized");
        return echoInstance;
    }

    // For now, use a fallback polling-based approach
    // In production, this would connect to Laravel Reverb or Pusher
    echoInstance = {
        initialized: false,
        subscriptions: {},

        /**
         * Subscribe to a channel
         */
        channel(channelName) {
            if (!this.subscriptions[channelName]) {
                this.subscriptions[channelName] = {
                    listeners: {},
                    subscribe: function (eventName, callback) {
                        if (!this.listeners[eventName]) {
                            this.listeners[eventName] = [];
                        }
                        this.listeners[eventName].push(callback);
                        return this;
                    },
                    listen: function (eventName, callback) {
                        return this.subscribe(eventName, callback);
                    },
                };
            }
            return this.subscriptions[channelName];
        },

        /**
         * Trigger a local event (for demo purposes)
         */
        triggerEvent(channelName, eventName, data) {
            const channel = this.subscriptions[channelName];
            if (channel && channel.listeners[eventName]) {
                channel.listeners[eventName].forEach((callback) => {
                    callback(data);
                });
            }
        },

        /**
         * Disconnect WebSocket
         */
        disconnect() {
            this.subscriptions = {};
            console.log("WebSocket disconnected");
        },
    };

    console.log("WebSocket initialized (polling fallback mode)");
    return echoInstance;
}

export function getWebSocketInstance() {
    return echoInstance;
}

export function disconnectWebSocket() {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
}

/**
 * Poll for election status updates (fallback from WebSocket)
 */
export async function pollElectionStatus(voterAPI, callback) {
    try {
        const response = await voterAPI.getElectionStatus();
        if (callback) {
            callback(response.data);
        }
        return response.data;
    } catch (error) {
        console.error("Error polling election status:", error);
    }
}

/**
 * Poll for live results (fallback from WebSocket)
 */
export async function pollLiveResults(voterAPI, callback) {
    try {
        const response = await voterAPI.getElectionLive();
        if (callback) {
            callback(response.data);
        }
        return response.data;
    } catch (error) {
        console.error("Error polling live results:", error);
    }
}
