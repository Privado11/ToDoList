
import { UnifiedSubscriptionService } from "@/service";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook genérico para gestionar cualquier tipo de suscripción
 * @param {string} subscriptionType - Tipo de suscripción ("conversations", "messages", "comments", etc.)
 * @param {Function} subscribeMethod - Método del servicio para suscribirse
 * @param {Function} unsubscribeMethod - Método del servicio para desuscribirse
 * @param {Function} setterFunction - Función que actualiza el estado con los datos recibidos
 * @returns {Object} - Métodos para gestionar la suscripción
 */
export const useSubscription = (
  subscriptionType,
  subscribeMethod,
  unsubscribeMethod,
  setterFunction
) => {
  const activeSubscriptionRef = useRef(null);
  const [resourceId, setResourceId] = useState(null);

  const subscribe = useCallback(
    (id, getDataFunction) => {
      // Si ya existe una suscripción activa, desuscribirse primero
      if (activeSubscriptionRef.current && resourceId) {
        unsubscribeMethod(resourceId);
      }

      setResourceId(id);

      // Validar la función de obtención de datos
      if (typeof getDataFunction !== "function") {
        console.error("getDataFunction debe ser una función");
        return null;
      }

      // Configurar los handlers según el tipo de suscripción
      const handlers = {};

      // Configurar dinámicamente el handler para el cambio basado en el tipo de suscripción
      // Cada tipo de suscripción tiene un nombre de manejador diferente
      const changeHandlerName = `on${
        subscriptionType.charAt(0).toUpperCase() + subscriptionType.slice(1)
      }Change`;
      handlers[changeHandlerName] = (updatedData) => {
        setterFunction(updatedData);
      };

      // Configurar el getter de datos según el tipo
      const getterName = getDataFunctionName(subscriptionType);
      handlers[getterName] = getDataFunction;

      // Llamar al método de suscripción con los handlers configurados
      const subscription = subscribeMethod(id, handlers);

      activeSubscriptionRef.current = subscription;
      return subscription;
    },
    [
      subscribeMethod,
      unsubscribeMethod,
      setterFunction,
      resourceId,
      subscriptionType,
    ]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && resourceId) {
      unsubscribeMethod(resourceId);
      activeSubscriptionRef.current = null;
      setResourceId(null);
    }
  }, [resourceId, unsubscribeMethod]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribe,
    unsubscribe,
    isSubscribed: !!activeSubscriptionRef.current,
    resourceId,
  };
};

// Función auxiliar para obtener el nombre del getter según el tipo de suscripción
const getDataFunctionName = (subscriptionType) => {
  switch (subscriptionType) {
    case "conversations":
      return "getConversations";
    case "messages":
      return "getMessages";
    case "comments":
      return "getComments";
    case "sharedTasks":
      return "getUsersFromSharedTask";
    case "notifications":
      return "getNotifications";
    default:
      return "getData";
  }
};

// Hooks específicos que utilizan el hook genérico

export const useTaskSubscription = (setSelectedTask) => {
  const taskIdRef = useRef(null);

  // Hook para comentarios y tareas compartidas en un solo lugar
  const subscribeToTask = useCallback(
    (id, getTaskById) => {
      taskIdRef.current = id;

      return UnifiedSubscriptionService.subscribeToTask(id, {
        onCommentsChange: (updatedComments) => {
          setSelectedTask((prevTask) =>
            prevTask
              ? {
                  ...prevTask,
                  comments: updatedComments,
                }
              : null
          );
        },
        onSharedTasksChange: (updatedSharedTasks) => {
          setSelectedTask((prevTask) =>
            prevTask
              ? {
                  ...prevTask,
                  shared_tasks: updatedSharedTasks,
                }
              : null
          );
        },
        getTaskById,
      });
    },
    [setSelectedTask]
  );

  const unsubscribe = useCallback(() => {
    if (taskIdRef.current) {
      UnifiedSubscriptionService.unsubscribeFromComments(taskIdRef.current);
      UnifiedSubscriptionService.unsubscribeFromSharedTasks(taskIdRef.current);
      taskIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return { subscribeToTask, unsubscribe };
};

export const useCommentsSubscription = (setComments) => {
  return useSubscription(
    "comments",
    UnifiedSubscriptionService.subscribeToComments.bind(
      UnifiedSubscriptionService
    ),
    UnifiedSubscriptionService.unsubscribeFromComments.bind(
      UnifiedSubscriptionService
    ),
    setComments
  );
};

export const useSharedTasksSubscription = (setSharedTasks) => {
  return useSubscription(
    "sharedTasks",
    UnifiedSubscriptionService.subscribeToSharedTasks.bind(
      UnifiedSubscriptionService
    ),
    UnifiedSubscriptionService.unsubscribeFromSharedTasks.bind(
      UnifiedSubscriptionService
    ),
    setSharedTasks
  );
};

export const useNotificationsSubscription = (setNotifications) => {
  return useSubscription(
    "notifications",
    UnifiedSubscriptionService.subscribeToUserNotifications.bind(
      UnifiedSubscriptionService
    ),
    UnifiedSubscriptionService.unsubscribeFromNotifications.bind(
      UnifiedSubscriptionService
    ),
    setNotifications
  );
};

export const useChatSubscription = (setConversations) => {
  return useSubscription(
    "conversations",
    UnifiedSubscriptionService.subscribeToUserConversations.bind(
      UnifiedSubscriptionService
    ),
    UnifiedSubscriptionService.unsubscribeFromConversation.bind(
      UnifiedSubscriptionService
    ),
    setConversations
  );
};

export const useMultiMessageSubscription = () => {
  const activeSubscriptionsRef = useRef(new Map());

  const subscribeToMessages = useCallback(
    (conversationId, getMessages, onMessagesChange) => {
      // Si ya existe una suscripción para esta conversación, no crear otra
      if (activeSubscriptionsRef.current.has(conversationId)) {
        return;
      }

      const subscription = UnifiedSubscriptionService.subscribeToMessages(
        conversationId,
        {
          onMessagesChange: (updatedMessages) => {
            onMessagesChange(conversationId, updatedMessages);
          },
          getMessages: () => getMessages(conversationId),
        }
      );

      activeSubscriptionsRef.current.set(conversationId, subscription);
    },
    []
  );

  const unsubscribeFromMessages = useCallback((conversationId) => {
    if (activeSubscriptionsRef.current.has(conversationId)) {
      UnifiedSubscriptionService.unsubscribeFromMessages(conversationId);
      activeSubscriptionsRef.current.delete(conversationId);
    }
  }, []);

  const unsubscribeFromAllMessages = useCallback(() => {
    activeSubscriptionsRef.current.forEach((_, conversationId) => {
      UnifiedSubscriptionService.unsubscribeFromMessages(conversationId);
    });
    activeSubscriptionsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeFromAllMessages();
    };
  }, [unsubscribeFromAllMessages]);

  return {
    subscribeToMessages,
    unsubscribeFromMessages,
    unsubscribeFromAllMessages,
  };
};
