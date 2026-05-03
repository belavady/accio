// Keys
const KEYS = {
  CODE_ID:   'accio_code_id',
  PARENT_ID: 'accio_parent_id',
  CHILD_ID:  'accio_child_id',
  CHILD_NAME:'accio_child_name',
  CHILD_AGE: 'accio_child_age',
  CHILD_GRADE:'accio_child_grade',
};

export const session = {
  setCode:    (id)   => localStorage.setItem(KEYS.CODE_ID, id),
  getCode:    ()     => localStorage.getItem(KEYS.CODE_ID),
  setParent:  (id)   => localStorage.setItem(KEYS.PARENT_ID, id),
  getParent:  ()     => localStorage.getItem(KEYS.PARENT_ID),
  setChild:   (child) => {
    localStorage.setItem(KEYS.CHILD_ID,    child.childId);
    localStorage.setItem(KEYS.CHILD_NAME,  child.childName);
    localStorage.setItem(KEYS.CHILD_AGE,   child.age);
    localStorage.setItem(KEYS.CHILD_GRADE, child.grade);
  },
  getChild:   () => ({
    childId:   localStorage.getItem(KEYS.CHILD_ID),
    childName: localStorage.getItem(KEYS.CHILD_NAME),
    age:       localStorage.getItem(KEYS.CHILD_AGE),
    grade:     localStorage.getItem(KEYS.CHILD_GRADE),
  }),
  hasParent:  () => !!localStorage.getItem(KEYS.PARENT_ID),
  hasChild:   () => !!localStorage.getItem(KEYS.CHILD_ID),
  clearChild: () => {
    localStorage.removeItem(KEYS.CHILD_ID);
    localStorage.removeItem(KEYS.CHILD_NAME);
    localStorage.removeItem(KEYS.CHILD_AGE);
    localStorage.removeItem(KEYS.CHILD_GRADE);
  },
  clearAll:   () => Object.values(KEYS).forEach(k => localStorage.removeItem(k))
};
