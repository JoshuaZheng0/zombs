import WebSocket from 'ws';

export type ClientsMap = Map<string, WebSocket>;

export interface PlayerState {
  x: number;
  y: number;
}

export type PlayerStatesMap = Map<string, PlayerState>;


