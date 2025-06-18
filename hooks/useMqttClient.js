/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useRef } from 'react'
import mqtt from 'mqtt'

export function useMqttClient({
    brokerUrl = 'wss://broker.emqx.io:8084/mqtt',
    subscribeTopics = [],
    publishTopic = '',
    mqttOptions = {},
}) {
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState([])
    const clientRef = useRef(null)

    // 建立 MQTT 連線
    useEffect(() => {
        const clientId = `nextjs-client-${Math.random().toString(16).slice(2, 10)}`
        const client = mqtt.connect(brokerUrl, {
            clientId,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
            ...mqttOptions,
        })

        clientRef.current = client

        client.on('connect', () => {
            console.log(`✅ 已連接 MQTT Broker: ${brokerUrl}`)
            setIsConnected(true)
        })

        client.on('message', (topic, payload) => {
            const message = {
                topic,
                payload: payload.toString(),
                timestamp: new Date().toISOString(),
            }
            setMessages((prevMessages) => [...prevMessages, message])
        })

        client.on('error', (err) => {
            console.error('MQTT Client 錯誤:', err)
            setIsConnected(false)
        })

        client.on('close', () => {
            console.warn('MQTT Client 連接已關閉')
            setIsConnected(false)
        })

        return () => {
            subscribeTopics.forEach((topic) => client.unsubscribe(topic))
            client.end()
        }
    }, [brokerUrl]) // ✅ 注意：不要把 subscribeTopics 放進來！

    // ✅ 當連線成功後再進行訂閱
    useEffect(() => {
        const client = clientRef.current
        if (isConnected && client) {
            subscribeTopics.forEach((topic) => {
                client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`❌ 訂閱主題 ${topic} 失敗:`, err)
                    } else {
                        console.log(`📥 已訂閱主題: ${topic}`)
                    }
                })
            })
        }
    }, [isConnected, subscribeTopics.join(',')])

    const publishMessage = (topic, msg) => {
        const client = clientRef.current
        if (!topic) {
            topic = publishTopic
        }
        if (client && isConnected && topic && msg.trim()) {
            client.publish(topic, msg, { qos: 0 }, (err) => {
                if (err) {
                    console.error(`發佈消息到 ${topic} 失敗:`, err)
                } else {
                    console.log(`已發佈消息到 ${topic}`)
                }
            })
        }
    }

    return { isConnected, messages, publishMessage }
}
