#import "RCTWhiteLabelModule.h"

@implementation RCTWhiteLabelModule

RCT_EXPORT_MODULE();

- (NSDictionary *)constantsToExport
{
  NSString *path = [[NSBundle mainBundle] pathForResource:@"whitelabel" ofType:@"json"];
  if (!path) {
    return @{};
  }

  NSData *data = [NSData dataWithContentsOfFile:path];
  if (!data) {
    return @{};
  }

  NSError *error = nil;
  NSDictionary *dictionary = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&error];
  if (error || !dictionary) {
    return @{};
  }

  return @{
    @"GRAPH_URL": dictionary[@"graph_url"] ?: @"",
    @"IOS_STORE_ID": dictionary[@"ios_store_id"] ?: @"",
    @"URI_SCHEME": dictionary[@"uri_scheme"] ?: @"",
    @"LIGHT_COLORS": dictionary[@"light_colors"] ?: @{},
    @"DARK_COLORS": dictionary[@"dark_colors"] ?: @{}
  };
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

@end
