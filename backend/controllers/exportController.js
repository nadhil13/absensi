import { executeQuery } from '../config/database.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Export attendance to Excel
export const exportToExcel = async (req, res) => {
    try {
        const { startDate, endDate, department, userId } = req.query;
        
        // Build query
        let query = `
            SELECT a.*, u.full_name, u.department, u.position, u.email 
            FROM attendance a 
            JOIN users u ON a.user_id = u.user_id 
            WHERE 1=1
        `;
        let queryParams = [];

        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        if (userId) {
            query += ' AND a.user_id = ?';
            queryParams.push(userId);
        }

        if (department) {
            query += ' AND u.department = ?';
            queryParams.push(department);
        }

        query += ' ORDER BY a.date DESC, u.full_name ASC';

        const attendanceData = await executeQuery(query, queryParams);

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Attendance Report');

        // Add headers
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Employee Name', key: 'full_name', width: 20 },
            { header: 'Employee ID', key: 'user_id', width: 15 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Position', key: 'position', width: 15 },
            { header: 'Check In', key: 'check_in_time', width: 12 },
            { header: 'Check Out', key: 'check_out_time', width: 12 },
            { header: 'Status', key: 'status', width: 10 },
            { header: 'Work Hours', key: 'work_hours', width: 12 },
            { header: 'Notes', key: 'notes', width: 20 }
        ];

        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '366092' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFF' } };

        // Add data
        attendanceData.forEach(record => {
            const checkIn = record.check_in_time ? new Date(record.check_in_time) : null;
            const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
            
            let workHours = '--';
            if (checkIn && checkOut) {
                const diffMs = checkOut - checkIn;
                const diffHours = diffMs / (1000 * 60 * 60);
                workHours = `${diffHours.toFixed(1)}h`;
            }

            worksheet.addRow({
                date: new Date(record.date).toLocaleDateString('id-ID'),
                full_name: record.full_name,
                user_id: record.user_id,
                department: record.department,
                position: record.position,
                check_in_time: checkIn ? checkIn.toLocaleTimeString('id-ID') : '--',
                check_out_time: checkOut ? checkOut.toLocaleTimeString('id-ID') : '--',
                status: record.status,
                work_hours: workHours,
                notes: record.notes || '--'
            });
        });

        // Auto-fit columns
        worksheet.columns.forEach(column => {
            column.width = column.width || 15;
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.xlsx`);

        // Write to response
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Export to Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export Excel file'
        });
    }
};

// Export attendance to PDF
export const exportToPDF = async (req, res) => {
    try {
        const { startDate, endDate, department, userId } = req.query;
        
        // Build query (same as Excel)
        let query = `
            SELECT a.*, u.full_name, u.department, u.position, u.email 
            FROM attendance a 
            JOIN users u ON a.user_id = u.user_id 
            WHERE 1=1
        `;
        let queryParams = [];

        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        if (userId) {
            query += ' AND a.user_id = ?';
            queryParams.push(userId);
        }

        if (department) {
            query += ' AND u.department = ?';
            queryParams.push(department);
        }

        query += ' ORDER BY a.date DESC, u.full_name ASC';

        const attendanceData = await executeQuery(query, queryParams);

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${Date.now()}.pdf`);
        
        // Pipe to response
        doc.pipe(res);

        // Add header
        doc.fontSize(20).text('Attendance Report', 50, 50);
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString('id-ID')}`, 50, 80);
        
        if (startDate && endDate) {
            doc.text(`Period: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`, 50, 100);
        }

        // Add table headers
        let yPosition = 140;
        const headerY = yPosition;
        
        doc.fontSize(10);
        doc.text('Date', 50, headerY);
        doc.text('Name', 100, headerY);
        doc.text('ID', 200, headerY);
        doc.text('Department', 250, headerY);
        doc.text('Check In', 320, headerY);
        doc.text('Check Out', 380, headerY);
        doc.text('Status', 450, headerY);
        doc.text('Hours', 500, headerY);

        // Draw header line
        doc.moveTo(50, headerY + 15).lineTo(550, headerY + 15).stroke();
        
        yPosition += 25;

        // Add data rows
        attendanceData.forEach((record, index) => {
            if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
            }

            const checkIn = record.check_in_time ? new Date(record.check_in_time) : null;
            const checkOut = record.check_out_time ? new Date(record.check_out_time) : null;
            
            let workHours = '--';
            if (checkIn && checkOut) {
                const diffMs = checkOut - checkIn;
                const diffHours = diffMs / (1000 * 60 * 60);
                workHours = `${diffHours.toFixed(1)}h`;
            }

            doc.fontSize(8);
            doc.text(new Date(record.date).toLocaleDateString('id-ID'), 50, yPosition, { width: 45 });
            doc.text(record.full_name.substring(0, 15), 100, yPosition, { width: 95 });
            doc.text(record.user_id, 200, yPosition, { width: 45 });
            doc.text(record.department.substring(0, 10), 250, yPosition, { width: 65 });
            doc.text(checkIn ? checkIn.toLocaleTimeString('id-ID') : '--', 320, yPosition, { width: 55 });
            doc.text(checkOut ? checkOut.toLocaleTimeString('id-ID') : '--', 380, yPosition, { width: 55 });
            doc.text(record.status, 450, yPosition, { width: 45 });
            doc.text(workHours, 500, yPosition, { width: 45 });

            yPosition += 20;

            // Draw separator line every 5 rows
            if ((index + 1) % 5 === 0) {
                doc.moveTo(50, yPosition - 5).lineTo(550, yPosition - 5).stroke('#EEEEEE');
            }
        });

        // Add footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).text(
                `Page ${i + 1} of ${pageCount}`,
                50,
                doc.page.height - 50,
                { align: 'center' }
            );
        }

        // Finalize PDF
        doc.end();

    } catch (error) {
        console.error('Export to PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export PDF file'
        });
    }
};

// Get export statistics
export const getExportStats = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;
        
        let query = `
            SELECT 
                COUNT(*) as total_records,
                COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
                COUNT(CASE WHEN status = 'late' THEN 1 END) as late_count,
                COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent_count,
                COUNT(DISTINCT user_id) as unique_employees,
                COUNT(DISTINCT date) as unique_dates
            FROM attendance a
            JOIN users u ON a.user_id = u.user_id
            WHERE 1=1
        `;
        let queryParams = [];

        if (startDate && endDate) {
            query += ' AND a.date BETWEEN ? AND ?';
            queryParams.push(startDate, endDate);
        }

        if (department) {
            query += ' AND u.department = ?';
            queryParams.push(department);
        }

        const stats = await executeQuery(query, queryParams);

        res.json({
            success: true,
            data: stats[0]
        });

    } catch (error) {
        console.error('Get export stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get export statistics'
        });
    }
};