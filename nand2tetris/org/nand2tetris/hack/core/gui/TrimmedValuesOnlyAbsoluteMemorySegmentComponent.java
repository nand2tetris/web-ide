/********************************************************************************
 * The contents of this file are subject to the GNU General Public License      *
 * (GPL) Version 2 or later (the "License"); you may not use this file except   *
 * in compliance with the License. You may obtain a copy of the License at      *
 * http://www.gnu.org/copyleft/gpl.html                                         *
 *                                                                              *
 * Software distributed under the License is distributed on an "AS IS" basis,   *
 * without warranty of any kind, either expressed or implied. See the License   *
 * for the specific language governing rights and limitations under the         *
 * License.                                                                     *
 *                                                                              *
 * This file was originally developed as part of the software suite that        *
 * supports the book "The Elements of Computing Systems" by Nisan and Schocken, *
 * MIT Press 2005. If you modify the contents of this file, please document and *
 * mark your changes clearly, for the benefit of others.                        *
 ********************************************************************************/

package org.nand2tetris.hack.core.gui;

import java.awt.Point;
import java.awt.Rectangle;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.TableModel;

/**
 * An AbsolutePointedMemorySegmentComponent that displays only the values column and
 * doesn't display addresses beyond the pointer address.
 */
public class TrimmedValuesOnlyAbsoluteMemorySegmentComponent extends AbsolutePointedMemorySegmentComponent {

    private static final long serialVersionUID = 6691524019674792256L;

    protected DefaultTableCellRenderer getCellRenderer() {
        return new TrimmedValuesOnlyTableCellRenderer();
    }

    /**
     * Returns the width of the table.
     */
    public int getTableWidth() {
        return 124;
    }

    /**
     * Returns the index of the values column.
     */
    protected int getColumnValue() {
        return 0;
    }

    /**
     * Sets the pointer with the given pointer address.
     */
    public synchronized void setPointer(int pointerAddress) {
        this.pointerAddress = (short)pointerAddress;
        segmentTable.revalidate();
        try {
            wait(100);
        } catch (InterruptedException ie) {}
        scrollToPointer();
    }

    /**
     * Scrolls the table to the pointer location.
     */
    protected void scrollToPointer() {
        Rectangle r = segmentTable.getCellRect(pointerAddress - startAddress - 1, 0, true);
        segmentTable.scrollRectToVisible(r);
        repaint();
    }

    /**
     * Returns the coordinates of the top left corner of the value at the given index.
     */
    public Point getCoordinates(int index) {
        double visibleRowsCount = Utilities.computeVisibleRowsCount(segmentTable);
        int location = (int)Math.max(Math.min(index - startAddress, visibleRowsCount - 1), 0);
        Rectangle r = segmentTable.getCellRect(location, 0, true);
        segmentTable.scrollRectToVisible(r);
        setTopLevelLocation();
        return new Point((int)(r.getX() + topLevelLocation.getX()),
                         (int)(r.getY() + topLevelLocation.getY()));
    }

    /**
     * Returns the appropriate table model.
     */
    protected TableModel getTableModel() {
        return new TrimmedValuesOnlyAbsoluteTableModel();
    }

    // An inner class representing the model of this table.
    class TrimmedValuesOnlyAbsoluteTableModel extends AbsoluteTableModel {

        private static final long serialVersionUID = -4377960120177269610L;

        /**
         * Returns the number of columns.
         */
        public int getColumnCount() {
            return 1;
        }

        /**
         * Returns the number of rows.
         */
        public int getRowCount() {
            return Math.max(pointerAddress - startAddress, 0);
        }

        /**
         * Returns the value at a specific row and column.
         */
        public Object getValueAt(int row, int col) {
            return super.getValueAt(row, col + 1);
        }

        /**
         * Returns true of this table cells are editable, false -
         * otherwise.
         */
        public boolean isCellEditable(int row, int col) {
            return super.isCellEditable(row, col + 1);
        }
    }


    // An inner class which implements the cell renderer of the ram table, giving
    // the feature of aligning the text in the cells.
    class TrimmedValuesOnlyTableCellRenderer extends PointedMemorySegmentTableCellRenderer {

        private static final long serialVersionUID = 1227842130718021657L;

        public void setRenderer(int row, int column) {
            super.setRenderer(row, column + 1);
        }
    }
}
