import { useState, useEffect } from "react";

const useFetch = (url) => {
   const [data, setData] = useState([]);
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!url) {
         return;
      }

      const fetchData = async () => {
         setLoading(true);
         setError(null);

         try {
            const token = localStorage.getItem('token');

            // Xây dựng headers - token là optional (nếu có thì dùng)
            const headers = {
               'Content-Type': 'application/json'
            };

            if (token) {
               headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, {
               method: 'GET',
               headers: headers
            });

            const result = await res.json();

            if (!res.ok) {
               setLoading(false);
               return setError(result.message || 'Lỗi lấy dữ liệu!');
            }

            setData(result.data || []);
            setLoading(false);
         } catch (err) {
            setError("Lỗi kết nối Server!");
            setLoading(false);
         }
      };

      fetchData();
   }, [url]);

   return { data, error, loading };
};

export default useFetch;