import Store from 'electron-store';

class DataStore extends Store {
    private static instance: DataStore;
    
    private constructor() { 
        super()
    }

    public static getInstance(): DataStore {
        if (!DataStore.instance) {
            DataStore.instance = new DataStore();
        }

        return DataStore.instance;
    }

}

const store = DataStore.getInstance()

export default store