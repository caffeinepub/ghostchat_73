import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface EncryptedMessage {
    id: string;
    ciphertext: string;
    timestamp: bigint;
    senderId: string;
}
export interface GroupMessage {
    id: string;
    content: string;
    timestamp: bigint;
    senderId: string;
}
export type ChatId = string;
export type InviteToken = string;
export type GroupId = string;
export interface backendInterface {
    checkInviteToken(inviteToken: InviteToken): Promise<boolean>;
    createChat(username: string): Promise<[ChatId, InviteToken]>;
    createGroup(groupName: string, username: string): Promise<[GroupId, InviteToken]>;
    getChatInfo(chatId: ChatId, username: string): Promise<{
        participants: Array<string>;
        createdAt: bigint;
        messageCount: bigint;
    }>;
    getGroupByToken(inviteToken: InviteToken): Promise<GroupId>;
    getGroupInfo(groupId: GroupId): Promise<{
        participants: Array<string>;
        name: string;
        createdAt: bigint;
        messageCount: bigint;
    }>;
    getGroupMessages(groupId: GroupId): Promise<Array<GroupMessage>>;
    getMessages(chatId: ChatId, username: string): Promise<Array<EncryptedMessage>>;
    joinChat(inviteToken: InviteToken, username: string): Promise<ChatId>;
    joinGroup(inviteToken: InviteToken, username: string): Promise<GroupId>;
    sendGroupMessage(groupId: GroupId, username: string, content: string): Promise<void>;
    sendMessage(chatId: ChatId, username: string, ciphertext: string): Promise<void>;
}
