import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useCreateChat() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createChat(username);
    },
  });
}

export function useCheckInviteToken(token: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["checkToken", token],
    queryFn: async () => {
      if (!actor) return false;
      return actor.checkInviteToken(token);
    },
    enabled: !!actor && !isFetching && !!token,
    retry: false,
  });
}

export function useJoinChat() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      token,
      username,
    }: { token: string; username: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.joinChat(token, username);
    },
  });
}

export function useGetMessages(
  chatId: string,
  username: string,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messages", chatId, username],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages(chatId, username);
    },
    enabled: !!actor && !isFetching && enabled && !!chatId && !!username,
    refetchInterval: 2000,
    staleTime: 0,
  });
}

export function useGetChatInfo(
  chatId: string,
  username: string,
  enabled: boolean,
) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["chatInfo", chatId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getChatInfo(chatId, username);
    },
    enabled: !!actor && !isFetching && enabled && !!chatId && !!username,
    refetchInterval: 5000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      username,
      ciphertext,
    }: { chatId: string; username: string; ciphertext: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.sendMessage(chatId, username, ciphertext);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.chatId],
      });
    },
  });
}

// Group hooks

export function useCreateGroup() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      groupName,
      username,
    }: { groupName: string; username: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createGroup(groupName, username);
    },
  });
}

export function useJoinGroup() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      token,
      username,
    }: { token: string; username: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.joinGroup(token, username);
    },
  });
}

export function useSendGroupMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      groupId,
      username,
      content,
    }: { groupId: string; username: string; content: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.sendGroupMessage(groupId, username, content);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["groupMessages", variables.groupId],
      });
    },
  });
}

export function useGetGroupMessages(groupId: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGroupMessages(groupId);
    },
    enabled: !!actor && !isFetching && enabled && !!groupId,
    refetchInterval: 2000,
    staleTime: 0,
  });
}

export function useGetGroupInfo(groupId: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["groupInfo", groupId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getGroupInfo(groupId);
    },
    enabled: !!actor && !isFetching && enabled && !!groupId,
    refetchInterval: 5000,
  });
}
