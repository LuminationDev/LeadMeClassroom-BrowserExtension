function useStorage() {
  /**
  * Set chrome's local storage with the supplied object. {key: value} format.
  * @param obj {key: value} format
  */
  const setLocalStorage = <T extends object>(obj: T) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(obj, () => {
        resolve("Success");
      });
    });
  }

  /**
  * Retrieve a value from chrome's local storage related to the key that has been supplied.
  * @param key A string representing what an object was saved as.
  */
  const getLocalStorage = <T>(key: string) => {
    return new Promise<T>((resolve) => {
      chrome.storage.local.get(key, (item) => {
        key ? resolve(<T>item[key]) : resolve(<T>item);
      });
    });
  }

  /**
   * Remove an entry from chrome's local storage.
   * @param key A string representing what object value to remove.
   */
  const removeLocalStorage = <T>(key: string) => {
    return new Promise<T>((resolve) => {
      chrome.storage.local.remove(key, () => {
        key ? resolve(<T>"Success") : resolve(<T>"No entry");
      });
    });
  }

  /**
   * Clear local storage of any and all values that have been saved.
   */
  const clearLocalStorage = <T>() => {
    return new Promise<T>( (resolve) => {
      chrome.storage.local.clear(() => {
        resolve(<T>"Storage cleared");
      });
    });
  }

  /**
   * Set chrome's sync storage with the supplied object. {key: value} format.
   * @param obj {key: value} format
   */
  const setSyncStorage = <T extends object>(obj: T) => {
    return new Promise((resolve) => {
      chrome.storage.sync.set(obj, () => {
        resolve("Success");
      });
    });
  }

  /**
   * Retrieve a value from chrome's sync storage related to the key that has been supplied.
   * @param key A string representing what an object was saved as.
   */
  const getSyncStorage = <T>(key: string) => {
    return new Promise<T>((resolve) => {
      chrome.storage.sync.get(key, (item) => {
        key ? resolve(<T>item[key]) : resolve(<T>item);
      });
    });
  }

  /**
   * Remove an entry from chrome's sync storage.
   * @param key A string representing what object value to remove.
   */
  const removeSyncStorage = <T>(key: string) => {
    return new Promise<T>((resolve) => {
      chrome.storage.sync.remove(key, () => {
        key ? resolve(<T>"Success") : resolve(<T>"No entry");
      });
    });
  }

  /**
   * Clear sync storage of any and all values that have been saved.
   */
  const clearSyncStorage = <T>() => {
    return new Promise<T>( (resolve) => {
      chrome.storage.sync.clear(() => {
        resolve(<T>"Storage cleared");
      });
    });
  }

  /**
   * Watch the storage of a particular item for changes
   * @param key
   * @param callback
   */
  const addStorageChangeEventListener = (key: string, callback: (oldValue: any, newValue: any) => void) => {
    chrome.storage.onChanged.addListener((change: any) => {
      callback(change?.[key]?.oldValue, change?.[key]?.newValue);
    });
  }

  return {
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    clearLocalStorage,
    setSyncStorage,
    getSyncStorage,
    removeSyncStorage,
    clearSyncStorage,
    addStorageChangeEventListener
  }
}

export { useStorage }
