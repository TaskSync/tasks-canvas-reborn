import React from "react";

const TasksContext = React.createContext();

const TasksProvider = props => {


  return (
    <TasksContext.Provider
      value={(localstorage && !props.force) || props.tasks}
    >
      {props.children}
    </TasksContext.Provider>
  );
};

export { TasksContext, TasksProvider };
