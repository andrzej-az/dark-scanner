package scanner

import (
	"fmt"
	"math/rand"
	"net"
	"sync"
	"sync/atomic"
	"time"

	settings "dark_scanner/pkg/settings"

	ping "github.com/prometheus-community/pro-bing"
)

type Host struct {
	Ip    string `json:"Ip"`
	Ports []int  `json:"Ports"`
}

type Callbacks struct {
	OnScanStart      func()
	OnScanFinish     func()
	OnHostFound      func(Host)
	OnHostScanFinish func(Host)
	OnProgress       func(int)
}

// ipRange returns a list of IP addresses between startIP and endIP.
func ipRange(startIP, endIP string) ([]string, error) {
	start := net.ParseIP(startIP)
	end := net.ParseIP(endIP)

	if start == nil || end == nil {
		return nil, fmt.Errorf("invalid start or end IP address")
	}

	var ips []string
	for ip := start; !ip.Equal(end); ip = nextIP(ip) {
		ips = append(ips, ip.String())
	}
	ips = append(ips, end.String())
	return ips, nil
}

// nextIP generates the next IP address.
func nextIP(ip net.IP) net.IP {
	ip = ip.To4()
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
	return ip
}

// shuffleIPs shuffles the IP addresses in place.
func shuffleIPs(ips []string) {
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(ips), func(i, j int) {
		ips[i], ips[j] = ips[j], ips[i]
	})
}

// pingIP pings the given IP address and returns true if the host is reachable.
func pingIP(ip string) bool {
	pinger, err := ping.NewPinger(ip)
	if err != nil {
		return false
	}
	pinger.Count = 1
	pinger.Timeout = time.Second
	pinger.SetPrivileged(true)
	err = pinger.Run()
	if err != nil {
		return false
	}
	stats := pinger.Statistics()
	return stats.PacketsRecv > 0
}

// checkPorts tries to connect to the specified ports on the IP address and returns true if any are open.
func checkPorts(ip string, ports []int) []int {
	var openPorts []int
	for _, port := range ports {
		address := fmt.Sprintf("%s:%d", ip, port)
		conn, err := net.DialTimeout("tcp", address, 500*time.Millisecond)
		if err == nil {
			conn.Close()
			openPorts = append(openPorts, port)
		}
	}
	return openPorts
}

func worker(ips <-chan string, ports []int, wg *sync.WaitGroup, callbacks Callbacks, processedIPs *int32, totalIPs int) {
	defer wg.Done()
	for ip := range ips {
		pingChan := make(chan bool)
		portChan := make(chan struct {
			ports []int
		})

		// Ping IP in a separate goroutine
		go func(ip string) {
			pingChan <- pingIP(ip)
		}(ip)

		// Check ports in a separate goroutine
		go func(ip string) {
			openPorts := checkPorts(ip, ports)
			portChan <- struct {
				ports []int
			}{openPorts}
		}(ip)

		// Collect results from both goroutines
		pingResult := <-pingChan
		portResult := <-portChan

		if pingResult || len(portResult.ports) > 0 {
			host := Host{Ip: ip}
			callbacks.OnHostFound(host)
			host = Host{Ip: ip, Ports: portResult.ports}
			callbacks.OnHostScanFinish(host)
		}

		// Increment the processed IP counter atomically and report progress
		processed := atomic.AddInt32(processedIPs, 1)
		progress := int(float64(processed) / float64(totalIPs) * 100)
		callbacks.OnProgress(progress)
	}
}

func Scan(settings *settings.Settings, callbacks Callbacks) {

	ips, err := ipRange(settings.Range.StartIp, settings.Range.EndIp)
	callbacks.OnScanStart()
	if err != nil {
		fmt.Printf("Error generating IP range: %v\n", err)
		callbacks.OnScanFinish()
		return
	}

	// Shuffle the IPs before processing
	shuffleIPs(ips)

	ipChan := make(chan string, len(ips))
	results := make(chan string, len(ips))

	var wg sync.WaitGroup
	totalIPs := len(ips)     // Store total number of IPs
	processedIPs := int32(0) // Atomic counter for processed IPs

	// Start worker goroutines
	for i := 0; i < settings.NumWorkers; i++ {
		wg.Add(1)
		go worker(ipChan, settings.Ports, &wg, callbacks, &processedIPs, totalIPs)
	}

	// Send IPs to be processed
	go func() {
		for _, ip := range ips {
			ipChan <- ip
		}
		close(ipChan)
	}()

	// Wait for all workers to finish
	go func() {
		wg.Wait()
		close(results)
		callbacks.OnProgress(100)
		callbacks.OnScanFinish()
	}()

	// Print results
	for result := range results {
		fmt.Println(result)
	}

	callbacks.OnScanFinish()
}
