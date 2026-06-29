import type * as Party from "partykit/server";
import {
  applyPatch,
  createInitialState,
  type ClientMessage,
  type ServerMessage,
  type SessionState,
} from "@strob/lib/session-state";

export default class SessionServer implements Party.Server {
  private state: SessionState = createInitialState();
  private controllerToken: string | null = null;

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    this.send(conn, {
      type: "sync",
      state: this.state,
      viewerCount: [...this.room.getConnections()].length,
    });
  }

  onClose() {
    this.broadcastSync();
  }

  onMessage(raw: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      this.send(sender, { type: "error", message: "Invalid message" });
      return;
    }

    if (msg.type === "claim") {
      if (this.controllerToken && this.controllerToken !== msg.token) {
        this.send(sender, {
          type: "error",
          message: "Session already has a controller",
        });
        return;
      }
      this.controllerToken = msg.token;
      this.send(sender, { type: "claimed", ok: true });
      this.broadcastSync();
      return;
    }

    if (msg.type === "patch") {
      if (!this.controllerToken || msg.token !== this.controllerToken) {
        this.send(sender, { type: "error", message: "Not authorized" });
        return;
      }
      this.state = applyPatch(this.state, msg.state);
      this.broadcastSync();
      return;
    }
  }

  private send(conn: Party.Connection, message: ServerMessage) {
    conn.send(JSON.stringify(message));
  }

  private broadcastSync() {
    const payload: ServerMessage = {
      type: "sync",
      state: this.state,
      viewerCount: [...this.room.getConnections()].length,
    };
    this.room.broadcast(JSON.stringify(payload));
  }
}

SessionServer satisfies Party.Worker;
