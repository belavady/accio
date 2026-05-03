// Keys
const KEYS = {
  CODE_ID:      'accio_code_id',
  PARENT_ID:    'accio_parent_id',
  PARENT_TOKEN: 'accio_parent_token',
  CHILD_ID:     'accio_child_id',
  CHILD_NAME:   'accio_child_name',
  CHILD_AGE:    'accio_child_age',
  CHILD_GRADE:  'accio_child_grade',
  CHILD_TOKEN:  'accio_child_token',
};

export const session = {
  // Code
  setCode:    (id)   => localStorage.setItem(KEYS.CODE_ID, id),
  getCode:    ()     => localStorage.getItem(KEYS.CODE_ID),

  // Parent
  setParent:  (id, token) => {
    localStorage.setItem(KEYS.PARENT_ID, id);
    if (token) localStorage.setItem(KEYS.PARENT_TOKEN, token);
  },
  getParent:      () => localStorage.getItem(KEYS.PARENT_ID),
  getParentToken: () => localStorage.getItem(KEYS.PARENT_TOKEN),
  hasParent:      () => !!localStorage.getItem(KEYS.PARENT_ID),

  // Child
  setChild: (child) => {
    localStorage.setItem(KEYS.CHILD_ID,    child.childId);
    localStorage.setItem(KEYS.CHILD_NAME,  child.childName);
    localStorage.setItem(KEYS.CHILD_AGE,   child.age);
    localStorage.setItem(KEYS.CHILD_GRADE, child.grade);
    if (child.token) localStorage.setItem(KEYS.CHILD_TOKEN, child.token);
  },
  getChild: () => ({
    childId:   localStorage.getItem(KEYS.CHILD_ID),
    childName: localStorage.getItem(KEYS.CHILD_NAME),
    age:       localStorage.getItem(KEYS.CHILD_AGE),
    grade:     localStorage.getItem(KEYS.CHILD_GRADE),
  }),
  getChildToken:  () => localStorage.getItem(KEYS.CHILD_TOKEN),
  hasChild:       () => !!localStorage.getItem(KEYS.CHILD_ID),

  // Get the right token for the current context
  // Child token takes priority if present, falls back to parent token
  getActiveToken: () =>
    localStorage.getItem(KEYS.CHILD_TOKEN) ||
    localStorage.getItem(KEYS.PARENT_TOKEN) ||
    null,

  // Clear child session only (switch profile)
  clearChild: () => {
    localStorage.removeItem(KEYS.CHILD_ID);
    localStorage.removeItem(KEYS.CHILD_NAME);
    localStorage.removeItem(KEYS.CHILD_AGE);
    localStorage.removeItem(KEYS.CHILD_GRADE);
    localStorage.removeItem(KEYS.CHILD_TOKEN);
  },

  // Clear everything (sign out)
  clearAll: () => Object.values(KEYS).forEach(k => localStorage.removeItem(k))
};
