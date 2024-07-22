export const storedScript = storage.defineItem<string>(
    'local:storedScript',
    {
      defaultValue: '',
    },
);
