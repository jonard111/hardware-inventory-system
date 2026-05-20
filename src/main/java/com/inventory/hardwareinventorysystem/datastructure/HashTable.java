package com.inventory.hardwareinventorysystem.datastructure;

import com.inventory.hardwareinventorysystem.model.Hardware;
import java.util.LinkedList;

/**
 * Hash table implementation using separate chaining.
 */
public class HashTable {

    private LinkedList<Hardware>[] table;
    private int size;
    private int itemCount;

    private static final double LOAD_FACTOR_LIMIT = 0.75;

    public HashTable(int size) {
        this.size = size;
        this.itemCount = 0;

        table = new LinkedList[size];

        for (int i = 0; i < size; i++) {
            table[i] = new LinkedList<>();
        }
    }

    private int hash(String key) {
        return Math.abs(key.hashCode()) % size;
    }

    public void insert(Hardware item) {
        if ((double) itemCount / size >= LOAD_FACTOR_LIMIT) {
            resize();
        }

        int index = hash(item.getAssetId());
        table[index].add(item);
        itemCount++;
    }

    public Hardware search(String assetId) {
        int index = hash(assetId);
       

        for (Hardware item : table[index]) {
            if (item.getAssetId().equalsIgnoreCase(assetId)) {
                return item;
            }
        }
        

        return null;
    }

    public boolean delete(String assetId) {
        int index = hash(assetId);

        for (Hardware item : table[index]) {
            if (item.getAssetId().equalsIgnoreCase(assetId)) {
                table[index].remove(item);
                itemCount--;
                return true;
            }
        }

        return false;
    }

    private void resize() {
        LinkedList<Hardware>[] oldTable = table;

        size *= 2;
        table = new LinkedList[size];

        for (int i = 0; i < size; i++) {
            table[i] = new LinkedList<>();
        }

        itemCount = 0;

        for (LinkedList<Hardware> bucket : oldTable) {
            for (Hardware item : bucket) {
                int index = hash(item.getAssetId());
                table[index].add(item);
                itemCount++;
            }
        }
    }

    public LinkedList<Hardware>[] getTable() {
        return table;
    }

    public int getSize() {
        return size;
    }

    public int getItemCount() {
        return itemCount;
    }

    public double getLoadFactor() {
        return (double) itemCount / size;
    }
}