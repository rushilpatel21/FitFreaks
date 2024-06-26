import React, { useEffect,useState, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import Swal from 'sweetalert2'
import Cookies from "js-cookie";

function WaterLog() {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [waterDate, setWaterDate] = useState(new Date().toISOString().slice(0, 10));
  const [waterUnit, setWaterUnit] = useState('');
  const [waterQuantity, setWaterQuantity] = useState('');
  const [waterData,setWaterData] = useState([]);
  const [userName, setUserName] = useState('');
  const [apiData,setApiData] = useState([]);
  const [todayWaterData, setTodayWaterData] = useState([]); // Here i store todays data.

  useEffect(() => {
    const userState = Cookies.get("isLoggedIn");
    if ( !userState  || userState===null || userState === 'false') {
      setShowNotification(true);
    }else{
      const storedUser = JSON.parse(Cookies.get('userDetail'));
      setUserName(storedUser.username);
    }
  }, []);

  useEffect(() => {
    if (waterData && waterData.length !== 0) {
      setWaterUnit('');
      setWaterQuantity('');
    }
  }, [waterData]);

  const handleSubmit = useCallback (async (e) => {
    e.preventDefault(); 
    if(waterDate && waterQuantity && waterUnit && userName){
      const waterObj = {
        userName,
        waterDate,
        waterQuantity,
        waterUnit
      }
      setWaterData(waterObj);
      try{
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/waterLogGet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(waterObj)
        });
        if (response.ok) {
          const today = new Date().toISOString.slice(0,10);
          if(waterDate === today){
            setTodayWaterData([...todayWaterData,waterObj]);
          }
        } else {
          console.error('Failed to submit data');
        }
      } catch (error) {
        console.error('Error submitting data:', error);
      }
    }else{
      alert('error');
    }



  },[userName,waterQuantity,waterDate, waterUnit, todayWaterData])

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const storedUser = JSON.parse(Cookies.get('userDetail'));
        const userId = storedUser.username;
        if(userId === ''){
          return;
        }
        const uri = `${process.env.REACT_APP_BACKEND_URL}/api/waterlog/` + userId;
        const response = await axios.get(uri);
  
  
        if (response.status === 200) {
          setApiData(response.data.waterLogs);
        } else {
          throw new Error("Failed to fetch water data");
        }
      } catch (error) {
        if (error.response) {
          console.error('Server responded with error status:', error.response.status);
          console.error('Error response data:', error.response.data);
        } else if (error.request) {
          console.error('No response received from the server:', error.request);
        } else {
          console.error('Error setting up the request:', error.message);
        }
      }
  
    }
    fetchData();
    

  }, [handleSubmit,todayWaterData]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayData = apiData.filter((item) => item.waterDate === today);

    setTodayWaterData(todayData);
  }, [apiData]);

  const usingSwal = () => {
    Swal.fire({
      icon: "error",
      title: "User Not Logged In",
      text: "Please sign in to view log",
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sign In',
      cancelButtonText: 'Close',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/signin');
      } else {
        navigate('/');
      }
    });
    setShowNotification(false);
    
  }

    return (
      <>
      {showNotification && (
        usingSwal()
      )}
      <div className='water-log-container'>
        {!showNotification && (
          <>
            <div className='water-container'>
              <h2 className='water-title'>Log Water Intake</h2>
              <form onSubmit={handleSubmit} className='water-form'>
                <div>
                  <label className='date-water-log' htmlFor="waterDate">
                    Date :
                  </label>
                  <input
                    className="date-input"
                    type="date"
                    id="waterDate"
                    value={waterDate}
                    onChange={(e) => {
                      setWaterDate(e.target.value);
                    }}
                    required
                  />
                </div>
                <div>
                  <input className='water-form-quant'
                    type="number"
                    id="waterQuantity"
                    value={waterQuantity}
                    placeholder='Number of'
                    min="1"
                    onChange={(e) => {
                      setWaterQuantity(e.target.value);
                    }}
                    required
                  />
                  <select className='water-form-unit'
                    id="waterUnit"
                    value={waterUnit}
                    onChange={(e) => {
                      setWaterUnit(e.target.value);
                    }}
                    required
                  >
                    <option value="">Select an Option</option>
                    <option value="Glass">Glass</option>
                    <option value="l">Litre</option>
                    <option value="ml">Milli-Litre</option>
                  </select>              
                </div>
                <button type="submit">Add Water Intake</button>
              </form>
            </div>
            <div className='water-log-right'>
          
            <div className='today-workout-log-container'>
        <h2 className='today-workout-title'>Today's Water Intake</h2>
        <div className="today-workout-content">
          {todayWaterData.length === 0 ? (
            <p className='workout-sub-title'>No Water data available for today.</p>
          ) : (
            <table className='workout-table'>
              <thead>
                <tr>
                  <th className='workout-th'>Date</th>
                  <th className='workout-th'>Quantity</th>
                  <th className='workout-th'>Unit</th>
                </tr>
              </thead>
              <tbody>
                {todayWaterData.map((water, index) => (
                  <tr key={index}>
                    <td className='workout-td'>{water.waterDate}</td>
                    <td className='workout-td'>{water.waterQuantity}</td>
                    <td className='workout-td'>{water.waterUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
          
            </div>
          </>
        )}
      </div>
    </>
    );
  }

export default WaterLog;