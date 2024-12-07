// Contexto TaskContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Filters, Task } from "@/types/tasks-types";

interface TaskContextType {
  taskForModal: { task: Task };
  setTaskForModal: React.Dispatch<React.SetStateAction<{ task: Task }>>;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  showModal: boolean;
  showDeleteModal: boolean;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIdForDelete: React.Dispatch<React.SetStateAction<number>>;
  idForDelete: number;
  viewModal: boolean;
  setViewModal: React.Dispatch<React.SetStateAction<boolean>>;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [idForDelete, setIdForDelete] = useState<number>(0);
  const [taskForModal, setTaskForModal] = useState<{ task: Task }>({
    task: {
      id: 0,
      title: "",
      description: "",
      user: null,
      group: null,
      dueDate: new Date(),
      priority: { id: 0, name: "" },
      status: { id: 0, name: "" },
      creationDate: new Date(),
      comments: [],
    },
  });

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [viewModal, setViewModal] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    priority: "",
    assignedUserOrGroup: "",
    sortBy: "dueDate",
    sortOrder: "asc",
    typeOfAssigned: "person",
  });

  return (
    <TaskContext.Provider
      value={{
        taskForModal,
        setTaskForModal,
        setShowModal,
        showModal,
        showDeleteModal,
        setShowDeleteModal,
        setIdForDelete,
        idForDelete,
        viewModal,
        setViewModal,
        filters,
        setFilters,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
