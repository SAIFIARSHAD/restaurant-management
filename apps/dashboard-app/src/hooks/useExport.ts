import { useState } from 'react';
import api from '../api/axios';

const triggerDownload = (blob: Blob, filename: string) => {
  const url  = window.URL.createObjectURL(new Blob([blob]));
  const a    = document.createElement('a');
  a.style.display = 'none';
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};

interface ExportParams {
  startDate?: string;
  endDate?:   string;
}

export const useExport = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const exportSalesExcel = async (params: ExportParams) => {
    setLoading('sales');
    try {
      const res = await api.get('/export/sales/excel', {
        params,
        responseType: 'arraybuffer',   
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      triggerDownload(blob, `Sales_${params.startDate}_to_${params.endDate}.xlsx`);
    } finally {
      setLoading(null);
    }
  };

  const exportGSTPDF = async (params: ExportParams) => {
    setLoading('gst');
    try {
      const res = await api.get('/export/gst/pdf', {
        params,
        responseType: 'arraybuffer',   
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      triggerDownload(blob, `GST_${params.startDate}_to_${params.endDate}.pdf`);
    } finally {
      setLoading(null);
    }
  };

  const exportTopItemsExcel = async (params: ExportParams) => {
    setLoading('topItems');
    try {
      const res = await api.get('/export/top-items/excel', {
        params,
        responseType: 'arraybuffer',   
      });
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      triggerDownload(blob, `TopItems_${params.startDate}_to_${params.endDate}.xlsx`);
    } finally {
      setLoading(null);
    }
  };

  return { loading, exportSalesExcel, exportGSTPDF, exportTopItemsExcel };
};
