// main.dart
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/io.dart';

void main() async {
  try {
    final channel = IOWebSocketChannel.connect('ws://localhost:8080');
    print('Connected to server');

    // Set up message listener
    channel.stream.listen(
      (message) => print('Server: ${jsonDecode(message)}'),
      onError: (e) => print('Error: $e'),
      onDone: () {
        print('Disconnected');
        exit(0);
      },
    );

    // Handle input
    await for (String line
        in stdin.transform(utf8.decoder).transform(const LineSplitter())) {
      if (line == 'quit') {
        await channel.sink.close();
        exit(0);
      }
      channel.sink.add(jsonEncode({'type': 'MESSAGE', 'content': line}));
    }
  } catch (e) {
    print('Connection failed: $e');
    exit(1);
  }
}
