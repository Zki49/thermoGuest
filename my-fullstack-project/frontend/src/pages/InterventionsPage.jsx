import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import CreateInterventionForm from '../components/CreateInterventionForm';

const InterventionsPage = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/interventions');
      setInterventions(response.data);
    } catch (error) {
      message.error('Erreur lors de la récupération des interventions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Date prévue',
      dataIndex: 'scheduled_date',
      key: 'scheduled_date',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => window.location.href = `/interventions/${record.id}`}>
            Voir détails
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Interventions</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Nouvelle intervention
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={interventions}
        loading={loading}
        rowKey="id"
      />

      <CreateInterventionForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchInterventions();
        }}
      />
    </div>
  );
};

export default InterventionsPage; 