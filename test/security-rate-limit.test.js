import { expect } from "chai";
import { isIncrementalChatRead } from "../src/middlewares/security.js";

describe("Global rate-limit routing", () => {
  it("delegates only authenticated chat message reads to their route limiter", () => {
    expect(
      isIncrementalChatRead({
        method: "GET",
        path: "/api/chat/users/123/messages",
      }),
    ).to.equal(true);
    for (const req of [
      { method: "POST", path: "/api/chat/users/123/messages" },
      { method: "GET", path: "/api/chat/threads" },
      { method: "GET", path: "/api/chat/users/not-a-number/messages" },
      { method: "GET", path: "/api/text/discovery" },
    ])
      expect(isIncrementalChatRead(req)).to.equal(false);
  });
});
