export const scheduleListReducer = (state = { schedules: [] }, action) => {
  switch (action.type) {
    case 'SCHEDULE_LIST_REQUEST':
      return { loading: true };
    case 'SCHEDULE_LIST_SUCCESS':
      return { loading: false, schedules: action.payload };
    case 'SCHEDULE_LIST_FAIL':
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const scheduleCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SCHEDULE_CREATE_REQUEST':
      return { loading: true };
    case 'SCHEDULE_CREATE_SUCCESS':
      return { loading: false, success: true, schedule: action.payload };
    case 'SCHEDULE_CREATE_FAIL':
      return { loading: false, error: action.payload };
    case 'SCHEDULE_CREATE_RESET':
      return {};
    default:
      return state;
  }
};
