package com.inventory.hardwareinventorysystem.datastructure;

import com.inventory.hardwareinventorysystem.model.Hardware;
import java.util.Iterator;
import java.util.LinkedList;

/**
 * Hash table implementation using separate chaining.
 * Enforces a strict static capacity of 10 buckets.
 */
public class HashTable {

    private LinkedList<Hardware>[] table;
    private int size;
    private int itemCount;

    @SuppressWarnings("unchecked")
    public HashTable(int ignoredSize) {
        // Enforce the size constraint of 10 buckets
        this.size = 11;
        this.itemCount = 0;

        table = new LinkedList[this.size];

        for (int i = 0; i < this.size; i++) {
            table[i] = new LinkedList<>();
        }
    }

    private int hash(String key) {
        if (key == null) {
            return 0;
        }
        
        int numericValue = 0;
        for (int i = 0; i < key.length(); i++) {
            char c = key.charAt(i);
            
            if (Character.isDigit(c)) {
                numericValue = (numericValue * 10) + Character.getNumericValue(c);
            } else {
                numericValue = (numericValue * 31) + c;
            }
            numericValue = numericValue % 0x7FFFFFFF;
        }

        return Math.abs(numericValue) % size;
    }

    public void insert(Hardware item) {
        int index = hash(item.getAssetId());
        
        for (int i = 0; i < table[index].size(); i++) {
            if (table[index].get(i).getAssetId().equalsIgnoreCase(item.getAssetId())) {
                table[index].set(i, item); 
                return;
            }
        }
        
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

        Iterator<Hardware> iterator = table[index].iterator();
        while (iterator.hasNext()) {
            Hardware item = iterator.next();
            if (item.getAssetId().equalsIgnoreCase(assetId)) {
                iterator.remove();
                itemCount--;
                return true;
            }
        }
        return false;
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