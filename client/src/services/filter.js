export const filterProjects = (projects, filter) => {
    if (!filter) return projects;
    return projects.filter(project => project.status === filter);
  };
  
  export const sortProjects = (projects, sortBy) => {
    return [...projects].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
  };
  
  export const filterTasks = (tasks, filter) => {
    if (!filter) return tasks;
    return tasks.filter(task => task.priority === filter);
  };
  
  export const sortTasks = (tasks, sortBy) => {
    return [...tasks].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1;
      if (a[sortBy] > b[sortBy]) return 1;
      return 0;
    });
  };
  